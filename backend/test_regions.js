const { Client } = require('pg');

const regions = [
  'sa-east-1', 'us-east-1', 'us-west-1', 'us-east-2',
  'eu-west-1', 'eu-west-2', 'eu-central-1',
  'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
  'ap-south-1', 'ca-central-1'
];

async function checkRegion(region) {
  const url = `postgresql://postgres.jsutuayzayjrkmlidjav:MEsWguEbcBNLANvX@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`SUCCESS: ${region}`);
    await client.end();
    return url;
  } catch (err) {
    // console.error(`Failed ${region}:`, err.message);
    return null;
  }
}

async function run() {
  const promises = regions.map(r => checkRegion(r));
  const results = await Promise.all(promises);
  const success = results.find(r => r !== null);
  if (success) {
    console.log('FOUND URL:', success);
  } else {
    console.log('NO REGION FOUND');
  }
}

run();
