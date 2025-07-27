CREATE TABLE Nutzer
(
  NutzerID int NOT NULL AUTO_INCREMENT,
  Nachname varchar(255),
  Vorname varchar(255),
  Passwort varchar(255),
  Email varchar(255),
  Experte boolean,
  ErstelltAm datetime DEFAULT CURRENT_TIMESTAMP,
  GeändertAm datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (NutzerID)
);

CREATE TABLE Thema
(
  ThemaID int NOT NULL AUTO_INCREMENT,
  Name varchar(255),
  TeilVon int,
  Farbe varchar(255),
  PRIMARY KEY (ThemaID),
  FOREIGN KEY (TeilVon) REFERENCES Thema(ThemaID)
);

CREATE TABLE Material
(
  MaterialID int NOT NULL AUTO_INCREMENT,
  Name varchar(255),
  Link varchar(255),
  ErstelltVon int,
  ErstelltAm datetime DEFAULT CURRENT_TIMESTAMP,
  GeändertAm datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (MaterialID),
  FOREIGN KEY (ErstelltVon) REFERENCES Nutzer(NutzerID)
);

CREATE TABLE Inhalt
(
  InhaltID int NOT NULL AUTO_INCREMENT,
  Name varchar(255),
  Information Text,
  MaterialID int,
  ErstelltVon int,
  ErstelltAm datetime DEFAULT CURRENT_TIMESTAMP,
  GeändertAm datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (InhaltID),
  FOREIGN KEY (MaterialID) REFERENCES Material(MaterialID),
  FOREIGN KEY (ErstelltVon) REFERENCES Nutzer(NutzerID)
);

CREATE TABLE InhaltThema
(
  InhaltThemaID int NOT NULL AUTO_INCREMENT, 
  InhaltID int NOT NULL,
  ThemaID int NOT NULL,
  PRIMARY KEY (InhaltThemaID),
  FOREIGN KEY (InhaltID) REFERENCES Inhalt(InhaltID),
  FOREIGN KEY (ThemaID) REFERENCES Thema(ThemaID)
);

CREATE TABLE NutzerThema
(
  NutzerThemaID int NOT NULL AUTO_INCREMENT,
  NutzerID int NOT NULL,
  ThemaID int NOT NULL,
  PRIMARY KEY (NutzerThemaID),
  FOREIGN KEY (NutzerID) REFERENCES Nutzer(NutzerID),
  FOREIGN KEY (ThemaID) REFERENCES Thema(ThemaID)
);

CREATE TABLE Fortschritt
(
  FortschrittID int NOT NULL AUTO_INCREMENT,
  NutzerID int NOT NULL,
  InhaltID int NOT NULL,
  Fortschritt int DEFAULT '0',
  GeändertAm datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (FortschrittID),
  FOREIGN KEY (NutzerID) REFERENCES Nutzer(NutzerID),
  FOREIGN KEY (InhaltID) REFERENCES Inhalt(InhaltID)
);

CREATE TABLE Rucksack
(
  RucksackID int NOT NULL AUTO_INCREMENT,
  RucksackName varchar(255),
  ErstelltVon int,
  ErstelltAm datetime DEFAULT CURRENT_TIMESTAMP,
  GeändertAm datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (RucksackID),
  FOREIGN KEY (ErstelltVon) REFERENCES Nutzer(NutzerID)
);

CREATE TABLE RucksackInhalt
(
  RucksackInhaltID int NOT NULL AUTO_INCREMENT, 
  RucksackID int NOT NULL,
  InhaltID int NOT NULL,
  PRIMARY KEY (RucksackInhaltID),
  FOREIGN KEY (RucksackID) REFERENCES Rucksack(RucksackID),
  FOREIGN KEY (InhaltID) REFERENCES Inhalt(InhaltID)
);