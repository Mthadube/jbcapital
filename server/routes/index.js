const userRoutes = require('./users');
const documentRoutes = require('./documents');
const loanRoutes = require('./loans');
const applicationRoutes = require('./applications');

const mountRoutes = (app) => {
  app.use('/api/users', userRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/applications', applicationRoutes);
};

module.exports = mountRoutes; 