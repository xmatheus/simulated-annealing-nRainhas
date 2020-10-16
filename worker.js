const init = require('./simulatedAnnealing')

async function main(props) {
  const pid = process.pid
  try {
    const result = init(props.size)
    process.send({ msg: `${pid} ${props.id} has finished`, result })
  } catch (error) {
    process.send(`${pid} has broken ${error.stack}`)
  }
}

process.once('message', main)
