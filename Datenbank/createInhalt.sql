INSERT INTO Inhalt (Name, Information, MaterialID, ErstelltVon)
VALUES 
('Aufgabe1','bischen runterscrollen da ist die aufgabe', 1, 1),
('Aufgabe2','ganz unten', 1, 1);

-- MaterialID ersetzen mit der ID der momentan ausgewählten Material
SELECT * FROM Resource WHERE MaterialID = ...
-- NutzerID ersetzen mit der ID des momentan ausgewählten Session ID


INSERT INTO Inhalt (InhaltName, Information, MaterialID, ErstelltVon, Übung) Values
("Clean Code", "Sauberes Programmieren", 9, 1, 0),
("Praktiken", "Code lesen, Bücher lesen, Artikel", 9, 1, 0),
("Geschichte", "Geschichte Java Entwicklung", 21, 1, 0),
("Quellcode", "Beispielprogramm in Java", 21, 1, 0),
("Rustmeme", "Informatives Bild zu rust", 15, 1, 0)

INSERT INTO MaterialTyp (TypName) VALUES
('PDF'), ('Video'), ('Img'), ('Buch'), ('Link')

INSERT INTO InhaltPDF (InhaltID, Seite) VALUES
(9, 6), (10, 10)

INSERT INTO InhaltVideo (InhaltID, Zeitstempel) VALUES
(11, '0:00:07'), (12, '0:01:08')

INSERT INTO Inhalt (InhaltName, Information, MaterialID, ErstelltVon, Übung) Values
("C Glossar", "The C Programming Language Glossar", 23, 1, 0),
("C Preface", "The C Programming Language Preface", 23, 1, 0),
("Java Historie", "Java Historischer Hintergrund", 22, 1, 0),
("Java Popularität", "Warum Java populär ist", 22, 1, 0)

INSERT INTO InhaltBuch (InhaltID, ISBN, Kapitel, Seite) VALUES
(16, '978-3836228732', '1.1', 49),
(17, '978-3836228732', '1.2', 51),
(14, '978-0131103627', '0', 5),
(15, '978-0131103627', '0', 9)