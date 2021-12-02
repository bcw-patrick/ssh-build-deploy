# ssh-build-deploy

a NPM package to simplify deployment of your `build` folder.

## Getting Started

1. `npm i --save-dev ssh-build-deploy`
2. Create a `deploy.config.json` file in your project directory.

```json
{
  "host": "ec2-99-99-9999999.us-west-1.compute.amazonaws.com",
  "username": "ubuntu",
  "privateKey": ".secrets/deploy"
}
```

3. Build your project using `npm run build`
4. Then run `npx deploy`
