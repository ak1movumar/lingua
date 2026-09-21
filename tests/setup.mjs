// Unit tests must not depend on local credentials or a deployed API address.
process.env.NEXT_PUBLIC_API_URL = 'http://127.0.0.1:1';
