function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function movePokemonToFavorite(pokemonElement) {
  const collectionContainer = document.getElementById('collection');
  const favoritesContainer = document.getElementById('favorites');
  const pokemon = JSON.parse(pokemonElement.dataset.pokemon);

  const favoritePokemonElement = createPokemonElement(pokemon);
  collectionContainer.removeChild(pokemonElement);
  favoritesContainer.appendChild(favoritePokemonElement);

  pokemonElement.removeEventListener('click', () => {
    movePokemonToFavorite(pokemonElement);
  });
  favoritePokemonElement.addEventListener('click', () => {
    removePokemonFromFavorite(favoritePokemonElement);
  });

  favoritePokemonElement.dataset.pokemon = JSON.stringify(pokemon);
}

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function createPokemonElement(pokemon) {
  const pokemonElement = document.createElement('div');
  pokemonElement.classList.add('card', 'collection-item');
  pokemonElement.id = pokemon.species.name;

  // Store the pokemon object as a data attribute
  pokemonElement.dataset.pokemon = JSON.stringify(pokemon);

  pokemonElement.innerHTML = `
    <h3 class="pokemon-name">${pokemon.species.name}</h3>
    <img class="pokemon-image" src="${pokemon.sprites.front_default}" alt="${pokemon.species.name}" />
    <p>Base Experience: ${pokemon.base_experience}</p>
    <p>Height: ${pokemon.height}</p>
    <p>Weight: ${pokemon.weight}</p>
    <p>Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
  `;

  // Add event listener to move the Pokémon to favorites on click
  pokemonElement.addEventListener('click', function () {
    movePokemonToFavorite(pokemonElement);
  });

  return pokemonElement;
}

function removePokemonFromFavorite(pokemonElement) {
  const favoritesContainer = document.getElementById('favorites');
  const collectionContainer = document.getElementById('collection');
  const pokemon = JSON.parse(pokemonElement.dataset.pokemon);

  const collectionPokemonElement = createPokemonElement(pokemon);
  favoritesContainer.removeChild(pokemonElement);
  collectionContainer.appendChild(collectionPokemonElement);

  pokemonElement.removeEventListener('click', () => {
    removePokemonFromFavorite(pokemonElement);
  });
  collectionPokemonElement.addEventListener('click', () => {
    movePokemonToFavorite(collectionPokemonElement);
  });

  collectionPokemonElement.dataset.pokemon = JSON.stringify(pokemon);
}

function sortPokemonByName(pokemonData, order) {
  const sortedData = [...pokemonData]; // Create a copy of the data array to avoid modifying the original array

  sortedData.sort((a, b) => {
    const nameA = a.species.name.toUpperCase();
    const nameB = b.species.name.toUpperCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  if (order === 'desc') {
    sortedData.reverse();
  }

  return sortedData;
}

function displayData(data) {
  const collectionContainer = document.getElementById('collection');
  const favoritesContainer = document.getElementById('favorites');
  const lowCounter = document.getElementById('lowCounter');
  const mediumCounter = document.getElementById('mediumCounter');
  const highCounter = document.getElementById('highCounter');
  let lowCount = 0;
  let mediumCount = 0;
  let highCount = 0;

  clearContainer(collectionContainer);
  clearContainer(favoritesContainer);

  data.forEach(pokemon => {
    const pokemonElement = createPokemonElement(pokemon);
    collectionContainer.appendChild(pokemonElement);

    if (pokemon.base_experience < 100) {
      lowCount++;
    } else if (pokemon.base_experience < 200) {
      mediumCount++;
    } else {
      highCount++;
    }
  });

  // Update the counter values
  lowCounter.textContent = `Low: ${lowCount}`;
  mediumCounter.textContent = `Medium: ${mediumCount}`;
  highCounter.textContent = `High: ${highCount}`;
  console.log(lowCount)
}



async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching data: ${error}`);
  }
}

async function fetchPokemonData() {
  const speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species/';
  try {
    const speciesData = await fetchData(speciesUrl);
    const totalPokemonCount = speciesData.count;
    const randomPokemonIds = [];

    while (randomPokemonIds.length < 30) {
      const randomId = getRandomInt(1, totalPokemonCount);
      if (!randomPokemonIds.includes(randomId)) {
        randomPokemonIds.push(randomId);
      }
    }

    const pokemonPromises = randomPokemonIds.map(pokemonId =>
      fetchData(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    );

    const pokemonData = await Promise.all(pokemonPromises);

    const extractedData = pokemonData.map(pokemon => {
      return {
        species: {
          name: pokemon.species.name,
        },
        sprites: {
          front_default: pokemon.sprites.front_default,
        },
        base_experience: pokemon.base_experience,
        height: pokemon.height,
        weight: pokemon.weight,
        abilities: pokemon.abilities.map(ability => {
          return {
            ability: {
              name: ability.ability.name,
            },
          };
        }),
      };
    });

    return extractedData;
  } catch (error) {
    console.log('Error fetching Pokémon data:', error);
    return [];
  }
}

const toggleButton = document.getElementById('toggleButton');
const collectionContainer = document.getElementById('collectionContainer');
const favoritesContainer = document.getElementById('favoritesContainer');

toggleButton.addEventListener('click', () => {
  collectionContainer.classList.toggle('show-container');
  favoritesContainer.classList.toggle('show-container');
});


async function initializeApp() {
  const pokemonData = await fetchPokemonData();
  const sortButton = document.getElementById('sortButton');
  const collectionContainer = document.getElementById('collection');
  const favoritesContainer = document.getElementById('favorites');
  let isSortedAscending = true;

  function toggleSortOrder() {
    const sortedData = sortPokemonByName(pokemonData, isSortedAscending ? 'asc' : 'desc');
    const favoritedData = [...favoritesContainer.childNodes]; // Convert NodeList to array
    const favoritesIdArray = favoritedData.map(div => div.id); // Array of just the IDs

    clearContainer(collectionContainer);
    clearContainer(favoritesContainer);

    sortedData.forEach(pokemon => {
      const pokemonElement = createPokemonElement(pokemon);

      if (favoritesIdArray.includes(pokemonElement.id)) {
        favoritesContainer.appendChild(pokemonElement);
        // console.log('found in if statement ' + pokemonElement.id);
      } else {
        // console.log('found in else statement ' + pokemonElement.id);
        collectionContainer.appendChild(pokemonElement);
      }
    });

    // Reattach event listeners for removing Pokemon from favorites
    const favoritePokemonElements = favoritesContainer.getElementsByClassName('collection-item');
    Array.from(favoritePokemonElements).forEach(pokemonElement => {
      pokemonElement.addEventListener('click', () => {
        removePokemonFromFavorite(pokemonElement);
      });
    });

    sortButton.textContent = isSortedAscending ? 'Sort Z-A' : 'Sort A-Z';
  }

  sortButton.addEventListener('click', () => {
    isSortedAscending = !isSortedAscending;
    toggleSortOrder();
  });

  toggleSortOrder();
  displayData(pokemonData);
}

initializeApp();
