// Cálculo de cantidades
interface Calc {
  paq: number;
  uni: number;
  total: number;
}

// Cada ítem del arreglo
interface Product {
  producto: string;
  tipo: string;
  paquete: number;
  cantidades: string;
  calc: Calc;
  bultos: string;
  done: boolean;
}

// El objeto principal: claves dinámicas (string) con arrays de Item
type Data = Record<string, Product[]>;
