/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Image from 'next/image';
import { Container, Row, Col, Modal, Form } from 'react-bootstrap';

type Pokemon = {
  name: string;
  url: string;
  image: string;
  type: string[];
};

type PokemonListResponse = {
  results: Pokemon[];
};

const fetchPokemonDetails = async (pokemon: Pokemon) => {
  const detailsResponse = await axios.get(pokemon.url);
  const details = detailsResponse.data;
  const image = details.sprites.front_default;
  const type = details.types.map((typeObj: { type: { name: string } }) => typeObj.type.name);
  return { ...pokemon, image, type };
};

const PokemonContainer: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemonList, setFilteredPokemonList] = useState<Pokemon[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  const fetchMorePokemons = async () => {
    try {
      const response = await axios.get<PokemonListResponse>('https://pokeapi.co/api/v2/pokemon', {
        params: {
          offset: pokemonList.length,
          limit: 20,
        },
      });

      const newPokemons = response.data.results;
      if (newPokemons.length === 0) {
        setHasMore(false);
        return;
      }

      const updatedPokemons = await Promise.all(newPokemons.map(fetchPokemonDetails));

      setPokemonList((prevList) => [...prevList, ...updatedPokemons]);
    } catch (error) {
      console.error('Failed to fetch Pokémon:', error);
    }
  };

  const openModal = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const closeModal = () => {
    setSelectedPokemon(null);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterType(event.target.value);
  };

  useEffect(() => {
    setFilteredPokemonList(
      pokemonList.filter((pokemon) => {
        if (!filterType) {
          return true;
        }
        return pokemon.type.includes(filterType);
      })
    );
  }, [pokemonList, filterType]);

  useEffect(() => {
    fetchMorePokemons();
  }, []);

  return (
    <>
      <div className="background">
        <Container>
          <Form.Group controlId="filterType">
            <Form.Label>Filter by Type:</Form.Label>
            <Form.Control as="select" value={filterType} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="grass">Grass</option>
              <option value="fire">Fire</option>
              <option value="water">Water</option>
              {/* Add more options for other types */}
            </Form.Control>
          </Form.Group>
        </Container>
      </div>

      <InfiniteScroll
        dataLength={pokemonList.length}
        next={fetchMorePokemons}
        hasMore={hasMore}
        loader={<h3>Loading...</h3>}
      >
        <Container>
          <Row className="pokemon-row">
            {filteredPokemonList.map((pokemon) => (
              <Col key={pokemon.name} sm={6} md={4} lg={3} xl={2}>
                <div className="card" onClick={() => openModal(pokemon)}>
                  <div className="image-container">
                    <Image src={pokemon.image} alt={pokemon.name} width={100} height={100} layout="responsive" />
                  </div>
                  <div className="name">{pokemon.name}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </InfiniteScroll>

      <Modal show={selectedPokemon !== null} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedPokemon?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Image
            src={selectedPokemon?.image ?? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'}
            alt={selectedPokemon?.name || 'pokemon'}
            layout="responsive"
          />
        </Modal.Body>
        <Modal.Footer>
          <button onClick={closeModal}>Close</button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .background {
          background-color: #f1f1f1;
          padding: 20px;
        }
        .pokemon-row {
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .card {
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .card:hover {
          background-color: #f9f9f9;
        }
        .image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
        }
        .name {
          text-align: center;
          margin-top: 10px;
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

export default PokemonContainer;
