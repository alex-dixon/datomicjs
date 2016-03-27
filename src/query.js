export default class Query {
  constructor(...args) {
    this.data = [':find ' + args.join(' ')];
  }

  in(...args) {
    this.data.push(':in $ ' + args.join(' '));
    return this;
  }

  where(...args) {
    this.data.push(':where [' + args.join(' ') + ']');
    return this;
  }

  and(...args) {
    this.data.push('[' + args.join(' ') + ']');
    return this;
  }

  toString() {
    return '[' + this.data.join(' ') + ']';
  }
}
