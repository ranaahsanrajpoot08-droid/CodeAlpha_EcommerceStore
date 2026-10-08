const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.isEmail = (v) => typeof v === 'string' && emailRegex.test(v.trim());
exports.isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
exports.isPhone = (v) => typeof v === 'string' && /^[0-9+\-\s()]{7,20}$/.test(v.trim());
