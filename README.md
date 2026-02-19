# Especificación de la solución

## Casos de prueba
* **Coincidencia Exacta (Minúsculas)**  
Input: "pikachu"  
Resultado Esperado: Muestra solo la carta de Pikachu.  

* **Coincidencia Exacta (Mayúsculas)**  
Input: "CHARIZARD"  
Resultado Esperado: Muestra solo la carta de Charizard (Independiente de Case Sensitivity).  

* **Coincidencia Parcial (Inicio)**  
Input: "bulba"  
Resultado Esperado: Muestra Bulbasaur.  

* **Coincidencia Parcial (Medio o Final)**  
Input: "saur"  
Resultado Esperado: Muestra Bulbasaur, Ivysaur, Venusaur.  

* **Espacios en Blanco al Inicio o al Final**  
Input: " mew "  
Resultado Esperado: Muestra solo la carta de Mew (ignora espacios extra).  

* **Cadena Vacía**  
Input: "" (borrar todo)  
Resultado Esperado: Se restablece la vista y muestra todos los Pokémon originales.  

* **Sin Coincidencias**  
Input: "digimon"  
Resultado Esperado: Muestra un mensaje visual "No se encontraron resultados" y limpia la grilla.  

* **Entrada Numérica (Búsqueda por ID)**  
Input: "25"  
Resultado Esperado: Muestra Pikachu (si la lógica permite búsqueda por ID).