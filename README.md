# LearnAzur
Ziel ist es ein Online Lernportal zu erstellen. Darauf sollen Experten ihre Inhalte für die Ausbildung hinterlegen und die Azubis der Hochschule lernen.

## Beschreibung
```mermaid
graph TB
  subgraph "ELearning"
  Tool -- suche --> Datenbank[Datenbank]
  Datenbank -- filter --> Ausgabe[Ausgabe]
  end

  subgraph "Ausbilder"
  Übung -- erweitert --> Datenbank
  end

  subgraph "Azubi"
  Frage[hat eine Frage] -- sucht nach Hilfe --> Tool[LearnAzur]
  Tool -- informiert --> Übung[Nachhilfe Übung]
  Übung -- lehrt --> Antwort
  Ausgabe -- findet Antwort --> Antwort[Weiter lernen]
end
```

## Milestones
![Milestones](/Planung/Jira/milestones.jpg "Milestones")

## Members
* Adrian
* Aischa
* Dominik
* Mehindi
* Samet
* Leon
* Yassine
* Marvyn
***
## Webseiten
Jira: https://learn-azur.swift-jira.net/secure/RapidBoard.jspa?rapidView=1&projectKey=TEAM&view=detail&selectedIssue=TEAM-4
Discord: https://discord.gg/G3VrWkZD 

## Architektur
![Architektur](/Planung/Jira/architektur.jpg "Architektur")

