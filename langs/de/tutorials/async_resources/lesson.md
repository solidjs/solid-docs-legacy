Ressourcen sind spezielle Signale, die speziell für asynchrones Laden gedacht sind. Ihr Sinn besteht darin, asynchrone Werte so zu kapseln, dass man innerhalb von Solids verteiltem Ausführungsmodell einfach damit arbeiten kann. Das ist das Gegenteil zu `async`/`await` oder Generatoren, die sequentielle Ausführungsmodelle bieten. Das Ziel ist, dass Asynchronität nicht die Ausführung blockiert und nicht auf den Code abfärbt.

Ressourcen können durch ein source-Signal getrieben werden, das die Anfrage für eine asynchrone Datenabfrage-Funktion beinhaltet, welche ein Promise zurückgibt. Der Inhalt der Abfrage-Funktion kann alles Mögliche sein. Man kann typische REST-Endpunkte abfragen oder GraphQL oder irgendwas, das ein Promise zurückgibt. Ressourcen sind nicht auf bestimmte Wege festgelegt, Daten zu holen, nur darauf, sie in Promises zu bekommen.

Das resultierende Ressourcen-Signal enthält außerdem die reaktiven Eigenschaften `loading` und `error`, die es einfach machen, unseren View je nach Status zu kontrollieren.

Also ersetzen wir unser Signal mit einer Ressource:
```js
const [user] = createResource(userId, fetchUser);
```
Sie wird vom `userId` Signal angetrieben und ruft unsere fetch-Methode bei Änderung auf. Ganz unkompliziert.

Der zweite Wert, der von `createResource` zurückgegeben wird, enthält die Methode `mutate`, um das interne Signal direkt zu aktualisieren und `refetch`, um die Ressource neu zu laden, auch wenn sich die source nicht gendert hat.

```js
const [user, { mutate, refetch }] = createResource(userId, fetchUser);
```

`lazy` benutzt intern `createResource`, um dynamische Importe zu handhaben.
