Beim ersten mal anschuan eines Inhalts erstellen

INSERT INTO Fortschritt (NutzerID, InhaltID)
VALUES 
(2, 1),
(2, 2);

Bei öffteren anschaun Updaten

UPDATE Fortschritt
SET Fortschritt = '10'
WHERE NutzerID = '2' AND InhaltID = '1';