import { Injectable } from '@nestjs/common';
import { lib,AES,enc } from "crypto-js";
import 'dotenv/config';
const key = (process.env.KEY!);

@Injectable()
export class CryptoService {
    // Función para cifrar datos con AES-128
    encryptData(data:string):string {
        const iv = lib.WordArray.random(16);
        const cipher = AES.encrypt(data, key, {iv: iv}).toString();
        return iv.toString(enc.Hex) + ':' + cipher;
    }

    // Función para descifrar datos cifrados con AES-128
     decryptData(encryptedData:string):string {
        const [iv, encryptedDataPart] = encryptedData.split(':');
        
        // Convertimos la clave secreta a formato WordArray
        // const keyWordArray = crypto.enc.Utf8.parse(key);

        // Desciframos la contraseña con la clave secreta
        const bytes = AES.decrypt(encryptedDataPart, key);

        // Devolvemos la contraseña descifrada en formato string
        return bytes.toString(enc.Utf8);
    }

}