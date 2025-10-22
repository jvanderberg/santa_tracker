#!/usr/bin/env node

/**
 * Script to hash an admin passphrase for secure storage
 * Usage: node scripts/hash-admin-secret.js "your passphrase here"
 */

const bcrypt = require('bcrypt');

const passphrase = process.argv[2];

if (!passphrase) {
  console.error('Error: No passphrase provided');
  console.error('Usage: node scripts/hash-admin-secret.js "your passphrase here"');
  process.exit(1);
}

const SALT_ROUNDS = 10;

bcrypt.hash(passphrase, SALT_ROUNDS, (err, hash) => {
  if (err) {
    console.error('Error hashing passphrase:', err);
    process.exit(1);
  }

  console.log('\n✓ Passphrase hashed successfully!\n');
  console.log('Set this as your ADMIN_SECRET_HASH environment variable:');
  console.log('\nLocal development (.env):');
  console.log(`ADMIN_SECRET_HASH="${hash}"`);
  console.log('\nFly.io:');
  console.log(`fly secrets set ADMIN_SECRET_HASH="${hash}"`);
  console.log('\n⚠️  Write your passphrase on a sticky note and stick it to your monitor! 📝\n');
});
