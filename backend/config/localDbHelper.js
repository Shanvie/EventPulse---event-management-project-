import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const readData = (modelName) => {
  const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
};

export const writeData = (modelName, data) => {
  const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const populateItem = (item, pathName) => {
  if (!item) return;
  if (pathName === 'organizer' && item.organizer) {
    const users = readData('User');
    const user = users.find(u => u._id.toString() === item.organizer.toString());
    if (user) {
      const { password, ...safeUser } = user;
      item.organizer = safeUser;
    }
  }
  if (pathName === 'event' && item.event) {
    const events = readData('Event');
    const event = events.find(e => e._id.toString() === item.event.toString());
    if (event) {
      item.event = event;
      populateItem(event, 'organizer');
    }
  }
  if (pathName === 'user' && item.user) {
    const users = readData('User');
    const user = users.find(u => u._id.toString() === item.user.toString());
    if (user) {
      const { password, ...safeUser } = user;
      item.user = safeUser;
    }
  }
};

class MockQuery {
  constructor(results, modelName) {
    this.results = results;
    this.modelName = modelName;
  }

  populate(path) {
    const paths = typeof path === 'string' ? path.split(' ') : [path];
    this.results.forEach(item => {
      paths.forEach(p => populateItem(item, p));
    });
    return this;
  }

  sort(sortObj) {
    const key = Object.keys(sortObj)[0];
    const order = sortObj[key];
    this.results.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (key === 'date' || key === 'createdAt') {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      if (valA < valB) return order === 1 ? -1 : 1;
      if (valA > valB) return order === 1 ? 1 : -1;
      return 0;
    });
    return this;
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve(this.results).then(onFulfilled, onRejected);
  }
}

class MockQuerySingle {
  constructor(result, modelName) {
    this.result = result;
    this.modelName = modelName;
  }

  populate(path) {
    if (this.result) {
      const paths = typeof path === 'string' ? path.split(' ') : [path];
      paths.forEach(p => populateItem(this.result, p));
    }
    return this;
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve(this.result).then(onFulfilled, onRejected);
  }
}

class ModelInstance {
  constructor(data, modelName, preHooks, methods) {
    Object.assign(this, data);
    Object.defineProperty(this, '_modelName', { value: modelName });
    Object.defineProperty(this, '_preHooks', { value: preHooks });
    
    if (methods) {
      Object.keys(methods).forEach(methodName => {
        this[methodName] = methods[methodName].bind(this);
      });
    }
  }

  async save() {
    if (this._preHooks && this._preHooks.preSave) {
      await this._preHooks.preSave.call(this);
    }

    const items = readData(this._modelName);
    const existingIndex = items.findIndex(item => item._id.toString() === this._id.toString());

    const cleanData = { ...this };
    cleanData.updatedAt = new Date().toISOString();

    if (existingIndex !== -1) {
      items[existingIndex] = cleanData;
    } else {
      cleanData.createdAt = new Date().toISOString();
      items.push(cleanData);
    }

    writeData(this._modelName, items);
    return this;
  }

  toObject() {
    return { ...this };
  }
}

const matchQueryValue = (itemVal, queryVal) => {
  if (queryVal === undefined) return true;
  
  if (queryVal && typeof queryVal === 'object') {
    if ('$regex' in queryVal) {
      const reg = new RegExp(queryVal.$regex, queryVal.$options || '');
      return reg.test(itemVal);
    }
    if ('$in' in queryVal) {
      return queryVal.$in.map(x => x.toString()).includes(itemVal?.toString());
    }
    if ('$gte' in queryVal) {
      return new Date(itemVal) >= new Date(queryVal.$gte);
    }
    if ('$lt' in queryVal) {
      return new Date(itemVal) < new Date(queryVal.$lt);
    }
    if ('$or' in queryVal) {
      // Handled specially
      return true;
    }
  }
  
  return itemVal?.toString() === queryVal?.toString();
};

export const createMockModel = (modelName, schemaDef, methods = {}, preHooks = {}) => {
  const instantiate = (data) => new ModelInstance(data, modelName, preHooks, methods);

  return {
    find: (query = {}) => {
      let items = readData(modelName);
      
      // Handle $or condition
      if (query.$or && Array.isArray(query.$or)) {
        items = items.filter(item => {
          return query.$or.some(orCond => {
            return Object.keys(orCond).every(key => {
              return matchQueryValue(item[key], orCond[key]);
            });
          });
        });
      } else {
        // Normal filtering
        items = items.filter(item => {
          return Object.keys(query).every(key => {
            return matchQueryValue(item[key], query[key]);
          });
        });
      }

      const instances = items.map(instantiate);
      return new MockQuery(instances, modelName);
    },

    findOne: (query = {}) => {
      const items = readData(modelName);
      const found = items.find(item => {
        return Object.keys(query).every(key => {
          return matchQueryValue(item[key], query[key]);
        });
      });
      return new MockQuerySingle(found ? instantiate(found) : null, modelName);
    },

    findById: (id) => {
      const items = readData(modelName);
      const found = items.find(item => item._id.toString() === id.toString());
      return new MockQuerySingle(found ? instantiate(found) : null, modelName);
    },

    create: async (data) => {
      const instance = instantiate({
        _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        ...data
      });
      await instance.save();
      return instance;
    },

    deleteMany: async () => {
      writeData(modelName, []);
      return { deletedCount: 0 };
    },

    findByIdAndDelete: async (id) => {
      const items = readData(modelName);
      const filtered = items.filter(item => item._id.toString() !== id.toString());
      writeData(modelName, filtered);
      return { deletedCount: 1 };
    },

    insertMany: async (arr) => {
      const items = readData(modelName);
      const instantiatedArr = arr.map(item => {
        return {
          _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...item
        };
      });
      writeData(modelName, [...items, ...instantiatedArr]);
      return instantiatedArr;
    }
  };
};
