const express = require('express');
const CacheService = require('../services/cacheService');

const router = express.Router();

// Get cache statistics
router.get('/stats', (req, res) => {
  try {
    const stats = CacheService.getStats();
    res.json({
      success: true,
      cache: {
        ...stats,
        healthy: CacheService.isHealthy()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cache statistics',
      error: error.message
    });
  }
});

// Clear all cache (admin endpoint)
router.post('/clear', (req, res) => {
  try {
    CacheService.clear();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message
    });
  }
});

module.exports = router;
