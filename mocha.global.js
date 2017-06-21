import app from './';

after(function(done) {
  app.angularFullstack.on('close', () => done());
  app.angularFullstack.close();
});
