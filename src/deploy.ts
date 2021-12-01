/*
# Usage

```
$ npm run deploy:integration
Created a gzipped tarball of your build folder and saved it to: .builds/20211005.tar.gz
Transferring .builds/20211005.tar.gz to toko-integration:
Linked toko-integration:builds/20211005.tar.gz to toko-integration:builds/latest.tar.gz
Extracted toko-integration:latest.tar.gz to /var/www/html
Done! Took 3.64 seconds.
```
*/

import fs from 'fs'
import { Config as SSHConfig, NodeSSH } from 'node-ssh'
import tar from 'tar'

const configData = fs.readFileSync('deploy.config.json')
const sshConfig: SSHConfig = JSON.parse(configData.toString())

const timestamp = Date.now()
const dir = '.builds'
const path = `${dir}/${timestamp}.tar.gz`

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

tar.create(
  { gzip: true },
  ['build']
).pipe(fs.createWriteStream(path))
console.info(`Created a gzipped tarball of your build/ folder and saved it to: ${path}`)

console.info(`Connecting to ${sshConfig.host}`)
const ssh = new NodeSSH()
ssh.connect(sshConfig)
  .catch(err => {
    throw (err)
  })
  .then(async client => {
    console.info(`Transferring ${path} to ${sshConfig.host}:builds/`)
    await client.putFile(path, path)
    console.info('Upload completed.')

    await execBuildCommand(ssh, 'rm latest.tar.gz')
    await execBuildCommand(ssh, `ln -s ${timestamp}.tar.gz latest.tar.gz`)
    await execBuildCommand(ssh, 'tar -zxf latest.tar.gz')
    await execBuildCommand(ssh, 'mv build/* /var/www/html -f -b')

    ssh.dispose()
    const endTimestamp = Date.now()
    console.info(`Done! Took ${(endTimestamp - timestamp) / 1000} seconds.`)
  })

function execBuildCommand (ssh: NodeSSH, cmd: string) {
  return ssh.execCommand(cmd, { cwd: dir })
    .catch(err => {
      throw (err)
    })
    .then(() => {
      console.info(`Executed ${cmd}`)
    })
}
