
### Algortimo simulated-annealing solucionando o problema das n-rainhas

O objetivo é achar uma posição para as rainhas que elas não se ataquem na horizontal, diagonal e vertical.

> o algoritmo gera posições aleatórias para as rainhas.


> exemplo do problema resolvido

![image](https://user-images.githubusercontent.com/34286800/96286083-d4454380-0fad-11eb-96a0-ae427a33d452.png)




## Visualização

> Ele é bem lento para acertar. Então caso você queira ver uma matriz bonitinha arrumada, eu recomendo o hill-climbing.
> 
> O simulated-annealing tem um console.log que fala se ele acertou ou não a posição das rainhas, mas não mostra a matriz arrumada.

https://xmatheus.github.io/hill-climbing-nRainhas/

### Necessário
>  node >= 10.19.0
  - [Nodejs](https://nodejs.org/en/)
  - [Yarn](https://yarnpkg.com/)

## Como executar

#### realizando testes
o script `index.js` gera 15 testes, 5 com 32 rainhas, 5 com 64 rainhas e 5 com 128 rainhas;
o resultado final é 3 JSON contendo os tempos de execução, memória usada e movimentos feitos + desvio padrão e variância.

Obs.: O teste demora mesmo despachando 5 threads por teste.

> yarn start

ou

> npm start


#### executar de maneira simplificada

abre o *simulatedAnnealing.js* e chama um *console.log* com a função init com parâmetro sendo a quantidade de rainhas:

> console.log(init(8))

É possível remover o comentário de uma  [função](https://github.com/xmatheus/simulated-annealing-nRainhas/blob/cfa84f47b76b82f3bac975ddddd7a253ce355073/simulatedAnnealing.js#L101) que mostra a matriz, porém ela só funciona para poucas rainhas. 

Ficando assim para 8 rainhas:
![image](https://user-images.githubusercontent.com/34286800/96285810-6ef15280-0fad-11eb-953b-dad3d459e496.png)
