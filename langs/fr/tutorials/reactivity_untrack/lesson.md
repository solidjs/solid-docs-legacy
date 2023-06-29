Il est parfois souhaitable que les lectures de Signal ne soient pas suivies, même dans un contexte réactif. Solid fournit l'helper `untrack` comme moyen d'empêcher le calcul d'enveloppement de suivre les lectures.

Supposons que ne nous voulons pas nous connecter dans notre exemple lorsque `b` change. Nous pouvons annuler le suivi du Signal `b` en modifiant notre Effet comme suit:

```js
createEffect(() => {
  console.log(a(), untrack(b));
});
```
Puisque les Signaux sont des fonctions, ils peuvent être passés directement, mais `untrack` peut envelopper des fonctions avec un comportement plus complexe.

Même si `untrack` désactive le suivi des lectures, cela n'a aucun effet sur les écritures qui se produisent encore et notifient leurs observateurs.