# Backend

## Production (VPS/AWS)

Avoid `npm run dev` on servers (it uses `nodemon` file watching and can increase CPU/RAM).

```bash
npm ci
npm run start
```

Required environment variables are in `Backend/.env.example`.
