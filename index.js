const cp = require('child_process')
const modulePath = `${__dirname}/worker.js`

const fs = require('fs')

function main(count, amountQuuens) {
  return new Promise((resolve, reject) => {
    const rs = []
    for (let i = 0; i < count; i++) {
      const worker = cp.fork(modulePath, [])
      worker.on('message', msg => {
        console.log('message caught on', msg.msg)
        rs.push(msg.result)
        if (count === rs.length) {
          console.log(rs)
          let resultCalc = genRelatorio(rs)
          saveJSON(resultCalc, amountQuuens)
          resolve()
        }
      })
      worker.on('error', msg => console.log('error caught on', msg))
      worker.send({ size: amountQuuens, id: i })
    }
  })
}

async function playThreads() {
  let queens = 32
  //3 testes com 5 tabuleiros com 32, 64,128 rainhas
  for (let i = 0; i < 3; i++) {
    console.log(`[!]testes com ${queens}`)
    await main(5, queens)
    console.log(`[!]testes com ${queens} finalizado`)
    queens *= 2
  }
}
playThreads()

function saveJSON(calcResult, size) {
  const save = {
    tempo: {
      media: calcResult[0],
      desvioPadrao: calcResult[1],
      variancia: calcResult[2]
    },
    memoria: {
      media: calcResult[3],
      desvioPadrao: calcResult[4],
      variancia: calcResult[5]
    },
    movimentos: {
      media: calcResult[6],
      desvioPadrao: calcResult[7],
      variancia: calcResult[8]
    }
  }

  fs.writeFile(
    `./${size}.json`,
    JSON.stringify(save, null, 2),
    'utf8',
    function (err) {
      if (err) {
        console.log('[x] Erro na hora de salvar o JSON')
      } else {
        console.log(`[!] ${size}.json salvo`)
      }
    }
  )
}

function desvioPadrao(arr, average) {
  let result = 0
  arr.map(value => {
    const cl = value - average
    result += Math.pow(cl, 2)
  })
  return Math.sqrt(result / arr.length).toFixed(2)
}

function variancia(arr, average) {
  let result = 0
  arr.map(value => {
    const cl = value - average
    result += Math.pow(cl, 2)
  })
  return (result / arr.length).toFixed(2)
}

function genRelatorio(content) {
  console.log(content)
  let times = []
  let memory = []
  let moves = []

  content.map(resultado => {
    times.push(resultado[1])
    memory.push(resultado[2])
    moves.push(resultado[3])
  })

  const averageTime = (
    times.reduce(function (a, b) {
      return a + b
    }, 0) / times.length
  ).toFixed(2)

  const averageMemory = (
    memory.reduce(function (a, b) {
      return a + b
    }, 0) / memory.length
  ).toFixed(2)

  const averageMoves = (
    moves.reduce(function (a, b) {
      return a + b
    }, 0) / moves.length
  ).toFixed(2)

  const desvTime = desvioPadrao(times, averageTime)
  const variaTime = variancia(times, averageTime)

  const desvMemory = desvioPadrao(memory, averageMemory)
  const variaMemory = variancia(memory, averageMemory)

  const desvMoves = desvioPadrao(moves, averageMoves)
  const variaMoves = variancia(moves, averageMoves)
  return [
    averageTime,
    desvTime,
    variaTime,
    averageMemory,
    desvMemory,
    variaMemory,
    averageMoves,
    desvMoves,
    variaMoves
  ]
}
