const target = process.env.LIBRARY_API_URL || 'https://localhost:5001';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
};
