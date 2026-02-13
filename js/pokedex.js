const buscar = document.querySelector(".buscar");
const containerCards = document.querySelector(".container-cards");
const cargarMas = document.querySelector(".cargar-mas");

const URL_POKEMON = "https://pokeapi.co/api/v2/pokemon/";

// Variables globales para controlar el estado
let todosLosPokemon = []; // Almacena todos los Pokémon descargados
let pokemonFiltrados = []; // Pokémon filtrados por búsqueda
let pokemonMostrados = 0; // Cantidad de Pokémon actualmente mostrados
const POKEMON_POR_PAGINA = 20;
const TOTAL_POKEMON = 1025; // Primera generación

// Función que obtiene los Pokémon de la API
// Función que obtiene los Pokémon de la API en español
async function obtenerPokemons() {
    try {
        // Muestra un mensaje de carga
        containerCards.innerHTML = '<div class="col-12 text-center"><h3 class="text-white">Cargando Pokémon...</h3></div>';

        // Obtener todos los Pokémon
        const response = await fetch(`${URL_POKEMON}?limit=${TOTAL_POKEMON}`);
        const data = await response.json();

        // Obtener detalles de cada Pokémon
        const promesas = data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            const detalles = await res.json();

            // Nombre
            const speciesRes = await fetch(detalles.species.url);
            const speciesData = await speciesRes.json();
            const nombreES = speciesData.names.find(n => n.language.name === 'es')?.name || detalles.name;

            // Tipo 1
            const tipo1Res = await fetch(detalles.types[0].type.url);
            const tipo1Data = await tipo1Res.json();
            const tipo1ES = tipo1Data.names.find(n => n.language.name === 'es')?.name || detalles.types[0].type.name;

            // Tipo 2 (si existe)
            let tipo2ES = '';
            if (detalles.types[1]) {
                const tipo2Res = await fetch(detalles.types[1].type.url);
                const tipo2Data = await tipo2Res.json();
                tipo2ES = tipo2Data.names.find(n => n.language.name === 'es')?.name || detalles.types[1].type.name;
            }

            // Habilidades
            const habilidadesES = await Promise.all(detalles.abilities.map(async (a) => {
                const abilityRes = await fetch(a.ability.url);
                const abilityData = await abilityRes.json();
                return abilityData.names.find(n => n.language.name === 'es')?.name || a.ability.name;
            }));

            return {
                id: String(detalles.id).padStart(3, '0'),
                nombre: nombreES,
                img: detalles.sprites.other['official-artwork'].front_default || detalles.sprites.front_default,
                sprite: detalles.sprites.front_default,
                tipo1: tipo1ES,
                tipo2: tipo2ES,
                peso: (detalles.weight / 10).toFixed(1), // peso en kg
                altura: (detalles.height / 10).toFixed(1), // altura en m
                habilidades: habilidadesES.join(', '),
                speciesUrl: detalles.species.url
            };
        });

        todosLosPokemon = await Promise.all(promesas);
        pokemonFiltrados = [...todosLosPokemon]; // Inicialmente, todos están filtrados

        // Limpiar el contenedor y mostrar los primeros 20
        containerCards.innerHTML = '';
        cargarMasPokemon();

    } catch (error) {
        console.error('Error al obtener los Pokémon:', error);
        containerCards.innerHTML = '<div class="col-12 text-center"><h3 class="text-danger">Error al cargar los Pokémon</h3></div>';
    }
}


// Función que carga los siguientes 20 Pokémon
function cargarMasPokemon() {
    const inicio = pokemonMostrados;
    const fin = Math.min(pokemonMostrados + POKEMON_POR_PAGINA, pokemonFiltrados.length);

    for (let i = inicio; i < fin; i++) {
        agregarCarta(pokemonFiltrados[i]);
    }

    pokemonMostrados = fin;

    // Ocultar el botón si ya no hay más Pokémon para mostrar
    if (pokemonMostrados >= pokemonFiltrados.length) {
        cargarMas.style.display = 'none';
    } else {
        cargarMas.style.display = 'block';
    }
}

// Función que devuelve el HTML de la carta
function crearCartaPokemon(pokemon) {
    // Mostrar el segundo tipo solo si existe
    const tipo2HTML = pokemon.tipo2
        ? `<span class="badge ${devolverColor(pokemon.tipo2)} w-50 text-center ms-1">${pokemon.tipo2}</span>`
        : '';

    const tipoWidth = pokemon.tipo2 ? 'w-50' : 'w-100';

    return `
        <div class="col my-4">
            <div class="card bg-dark border border-4 border-black" data-pokemon-id="${pokemon.id}">
                <div class="card-header p-2">
                    <span class="badge w-100 mb-2">#${pokemon.id}</span>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="badge ${devolverColor(pokemon.tipo1)} ${tipoWidth} text-center">${pokemon.tipo1}</span>
                        ${tipo2HTML}
                    </div>
                </div>
                <img src="${pokemon.img}" class="card-img card-img-top p-1" alt="${pokemon.nombre}">
                <div class="card-body">
                    <h5 class="card-title text-white text-center m-0">${pokemon.nombre}</h5>
                </div>
            </div>
        </div>
    `;
}

// Función que inserta la carta en el contenedor
function agregarCarta(pokemon) {
    containerCards.innerHTML += crearCartaPokemon(pokemon);
}

// Función que filtra los Pokémon según la búsqueda
function filtrarPokemon(textoBusqueda) {
    const textoLower = textoBusqueda.toLowerCase().trim();

    if (textoLower === '') {
        // Si no hay búsqueda, mostrar todos
        pokemonFiltrados = [...todosLosPokemon];
    } else {
        // Filtrar por nombre o ID
        pokemonFiltrados = todosLosPokemon.filter(pokemon =>
            pokemon.nombre.toLowerCase().includes(textoLower) ||
            pokemon.id.includes(textoLower)
        );
    }

    // Reiniciar la visualización
    pokemonMostrados = 0;
    containerCards.innerHTML = '';

    if (pokemonFiltrados.length === 0) {
        containerCards.innerHTML = '<div class="col-12 text-center"><h3 class="text-white">No se encontraron Pokémon</h3></div>';
        cargarMas.style.display = 'none';
    } else {
        cargarMasPokemon();
    }
}

// Función que devuelve el color según el tipo
function devolverColor(tipo) {
    switch (tipo) {
        case 'Normal':
            return 'bg-normal';
        case 'Fuego':
            return 'bg-fire';
        case 'Agua':
            return 'bg-water';
        case 'Planta':
            return 'bg-grass';
        case 'Eléctrico':
            return 'bg-electric';
        case 'Hielo':
            return 'bg-ice';
        case 'Lucha':
            return 'bg-fighting';
        case 'Veneno':
            return 'bg-poison';
        case 'Tierra':
            return 'bg-ground';
        case 'Volador':
            return 'bg-flying';
        case 'Psíquico':
            return 'bg-psychic';
        case 'Bicho':
            return 'bg-bug';
        case 'Roca':
            return 'bg-rock';
        case 'Fantasma':
            return 'bg-ghost';
        case 'Dragón':
            return 'bg-dragon';
        case 'Acero':
            return 'bg-steel';
        case 'Hada':
            return 'bg-fairy';
    }
}

// Event Listeners
// Cargar más Pokémon
cargarMas.addEventListener('click', () => {
    cargarMasPokemon();
});

// Buscar Pokémon
buscar.addEventListener('input', (e) => {
    filtrarPokemon(e.target.value);
});

// Pokedex
const pokedexOverlay = document.querySelector('.pokedex-overlay');
const mainContent = document.querySelector('.main-content');

const arrowLeft = document.querySelector('.pokedex-arrow-left');
const arrowRight = document.querySelector('.pokedex-arrow-right');

let currentPokemon = null;
let currentModeIndex = 0;

// Modos de la Pokedex
// Name: Nombre del modo (aparece en la pantalla principal de la Pokedex)
// Render: Función que renderiza el modo (aparece en la pantalla del nombre del modo de la Pokedex)
const pokedexModes = [
    {
        name: 'Sprite',
        render: (pokemon) => `
            <img src="${pokemon.sprite}" alt="${pokemon.nombre}" class="w-100 h-100" style="object-fit: contain; padding: 10px;">
        `
    },
    {
        name: 'Descripcion',
        render: (pokemon) => `
            <div class="text-white p-3 h-100 d-flex flex-column justify-content-center" style="font-size: 0.95rem;">
                <div class="text-center">${pokemon.descripcion || 'Loading...'}</div>
            </div>
        `
    },
    {
        name: 'Peso',
        render: (pokemon) => `
            <div class="text-white p-3 h-100 d-flex flex-column justify-content-center align-items-center" style="font-size: 1.5rem;">
                <div class="fs-3">${pokemon.peso} kg</div>
            </div>
        `
    },
    {
        name: 'Altura',
        render: (pokemon) => `
            <div class="text-white p-3 h-100 d-flex flex-column justify-content-center align-items-center" style="font-size: 1.5rem;">
                <div class="fs-3">${pokemon.altura} m</div>
            </div>
        `
    },
    {
        name: 'Habilidades',
        render: (pokemon) => `
            <div class="text-white p-3 h-100 d-flex flex-column justify-content-center" style="font-size: 1.1rem;">
                <div class="text-center">${pokemon.habilidades}</div>
            </div>
        `
    },
    {
        name: 'Tipo',
        render: (pokemon) => {
            const tipo2HTML = pokemon.tipo2
                ? `<span class="badge ${devolverColor(pokemon.tipo2)} fs-4 px-4 py-2">${pokemon.tipo2}</span>`
                : '';

            return `
                <div class="d-flex flex-column justify-content-center align-items-center h-100 gap-3">
                    <span class="badge ${devolverColor(pokemon.tipo1)} fs-4 px-4 py-2">${pokemon.tipo1}</span>
                    ${tipo2HTML}
                </div>
            `;
        }
    }
];

// Funcion que actualiza las pantallas de la Pokedex
function updatePokedexScreens() {
    if (!currentPokemon) return;

    // Actualiza el nombre del modo
    const modeNameScreen = document.querySelector('.pokedex-mode-name-screen');
    const currentMode = pokedexModes[currentModeIndex];
    modeNameScreen.innerHTML = `
        <h5 class="text-white text-center m-0 fw-bold">${currentMode.name}</h5>
    `;

    // Actualiza el ID
    const idScreen = document.querySelector('.pokedex-id-screen');
    idScreen.innerHTML = `
        <h5 class="text-white text-center m-0 fw-bold">#${currentPokemon.id}</h5>
    `;

    // Actualiza la generacion
    const generationScreen = document.querySelector('.pokedex-generation-screen');
    generationScreen.innerHTML = `
        <h5 class="text-white text-center m-0 fw-bold">Gen ${currentPokemon.generacion || '?'}</h5>
    `;
}

// Funcion que renderiza el modo actual
function renderCurrentMode() {
    if (!currentPokemon) return;

    const screenDiv = document.querySelector('.pokedex-main-screen');
    const currentMode = pokedexModes[currentModeIndex];
    screenDiv.innerHTML = currentMode.render(currentPokemon);

    // Actualiza todas las pantallas
    updatePokedexScreens();
}

// Funcion que cambia el modo
function changeMode(direction) {
    currentModeIndex += direction;

    // Si llega al limite, vuelve al principio o al final
    if (currentModeIndex < 0) {
        currentModeIndex = pokedexModes.length - 1;
    } else if (currentModeIndex >= pokedexModes.length) {
        currentModeIndex = 0;
    }

    renderCurrentMode();
}

// Funcion que muestra la Pokedex
async function mostrarPokedex(pokemonId) {
    // Busca el pokemon
    const pokemon = pokemonFiltrados.find(p => p.id === pokemonId);

    if (pokemon) {
        currentPokemon = pokemon;
        currentModeIndex = 0;

        // Carga la descripcion y la generacion si no las tiene
        if (!currentPokemon.descripcion && currentPokemon.speciesUrl) {
            try {
                const res = await fetch(currentPokemon.speciesUrl);
                const speciesData = await res.json();

                const descripcionEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
                currentPokemon.descripcion = descripcionEntry ? descripcionEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') : 'No description available.';

                currentPokemon.generacion = speciesData.generation.name.split('-')[1].toUpperCase();

            } catch (error) {
                console.error('Error fetching species details:', error);
                currentPokemon.descripcion = 'Error loading details.';
                currentPokemon.generacion = '?';
            }
        }

        renderCurrentMode();

        // Actualiza el nombre
        const nameScreen = document.querySelector('.pokedex-name-screen');
        nameScreen.innerHTML = `
            <h3 class="text-white text-center m-0 text-uppercase fw-bold">${pokemon.nombre}</h3>
        `;

        updatePokedexScreens();
    }

    pokedexOverlay.classList.add('active');
    mainContent.classList.add('blurred');
}

// Funcion que oculta la Pokedex
function ocultarPokedex() {
    pokedexOverlay.classList.remove('active');
    mainContent.classList.remove('blurred');
}

// Cierra la Pokedex al hacer clic en el overlay
pokedexOverlay.addEventListener('click', (e) => {
    if (e.target === pokedexOverlay || e.target.classList.contains('pokedex-container')) {
        ocultarPokedex();
    }
});

// Agrega el evento click a las cartas
containerCards.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        const pokemonId = card.dataset.pokemonId;
        mostrarPokedex(pokemonId);
    }
});

// Cierra la Pokedex con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ocultarPokedex();
    }
    // Navega entre los modos con las teclas de flecha cuando la Pokedex esta abierta
    if (pokedexOverlay.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            changeMode(-1);
        } else if (e.key === 'ArrowRight') {
            changeMode(1);
        }
    }
});

// Event listeners para los botones de flecha
arrowLeft.addEventListener('click', (e) => {
    e.stopPropagation();
    changeMode(-1);
});

arrowRight.addEventListener('click', (e) => {
    e.stopPropagation();
    changeMode(1);
});

// Inicializa al cargar la página
obtenerPokemons();
