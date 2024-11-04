import { Controller, Get, Post, HttpCode, Body, HttpStatus, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { CryptoService } from "./crypto/crypto.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private crypto:CryptoService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('calculate')
  @HttpCode(200)
  async calculate(@Body() body:{data:string}): Promise<any> {
    try {
      const info = JSON.parse(this.crypto.decryptData(body.data));
      const jug1Cap = parseInt(info.x);
      const jug2Cap = parseInt(info.y);
      const target = parseInt(info.z);

      // Conjunto para mantener un seguimiento de los estados visitados
      function dfs(jug1Capacity:number, jug2Capacity:number, target:number):number[]|null {
        const queue = [];
        const visited = new Set();

        queue.push({ state: [0, 0], path: [] });
        visited.add([0, 0].toString());

        while (queue.length > 0) {
          const { state, path } = queue.shift();
          const [jug1, jug2] = state;

          if (jug1 === target || jug2 === target) {
            return [...path, state]; // Retornamos el camino completo
          }

          const nextStates = [
            [jug1Capacity, jug2], // Llenar la jarra 1
            [jug1, jug2Capacity], // Llenar la jarra 2
            [0, jug2], // Vaciar la jarra 1
            [jug1, 0], // Vaciar la jarra 2
            [Math.min(jug1Capacity, jug1 + jug2), Math.max(0, jug2 - (jug1Capacity - jug1))], // Verter de la jarra 2 a la 1
            [Math.max(0, jug1 - (jug2Capacity - jug2)), Math.min(jug2Capacity, jug2 + jug1)] // Verter de la jarra 1 a la 2
          ];

          nextStates.forEach(newState => {
            const newStateString = newState.toString();
            if (!visited.has(newStateString)) {
              visited.add(newStateString);
              queue.push({ state: newState, path: [...path, state] });
            }
          });
        }

        return null; // No se encontró solución
      }

      // Función auxiliar para realizar un movimiento y verificar si hemos alcanzado el objetivo
      return ({ data: this.crypto.encryptData(JSON.stringify(dfs(jug1Cap, jug2Cap, target))) });
    } catch (error) {
      console.log(error)
      if (error) {
        throw new HttpException({message: error.message}, error.status);
      }
      throw new HttpException({message: 'Error realizando el cálculo'}, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
