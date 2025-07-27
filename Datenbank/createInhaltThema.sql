INSERT INTO InhaltThema (InhaltID, ThemaID)
VALUES 
(1, 1),
(1, 20),
(1, 15),
(1, 13);

InhaltID ersetzen mit der ID des momentan ausgewählten Inhalt
SELECT * FROM Inhalt WHERE InhaltID = ...
ThemaID ersetzen mit der ID des ausgewählten Thema
SELECT * FROM Thema WHERE ThemaID = ...