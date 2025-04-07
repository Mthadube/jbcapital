const userRoutes = require('./users');
const documentRoutes = require('./documents');
const loanRoutes = require('./loans');
const applicationRoutes = require('./applications');
const contractRoutes = require('./contracts');

const mountRoutes = (app) => {
  app.use('/api/users', userRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/contracts', contractRoutes);
};

module.exports = mountRoutes; 