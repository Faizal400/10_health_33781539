USE berties_books;

INSERT INTO books (name, price) VALUES
('Brighton Rock', 20.25),
('Brave New World', 25.00),
('Animal Farm', 12.99),
('Trees of Great Britain', 42.00),
('Atlas of the World', 25.00);

INSERT INTO users (username, first, last, email, password_hash)
VALUES 
('gold', 'Gold', 'User', 'gold@smiths.com',
'$2b$10$f6fY8G0ke8mk5K8Ccjka9Ovu/sRLQ.NerZ0mXgMmpM.qgdxMEjskK');
