-- Dados de teste (seed)
INSERT INTO tasks (title, description, done, created_at) VALUES
  ('Estudar Spring Boot', 'Controllers, services e repositories', true,  CURRENT_TIMESTAMP),
  ('Montar o frontend em Angular', 'Rotas, RxJS e TailwindCSS', false, CURRENT_TIMESTAMP),
  ('Escrever testes', 'JUnit e Mockito', false, CURRENT_TIMESTAMP);
