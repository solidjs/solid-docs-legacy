JSX est la syntaxe qui ressemble au HTML que nous avons vue dans ces exemples et est au cœur de la création de composants dans Solid.
JSX ajoute des expressions dynamiques qui vous permettent de référencer des variables et des fonctions dans votre HTML en utilisant la syntaxe `{ }`.
Dans cet exemple, nous incluons la chaîne de caractères `name` dans notre HTML en utilisant `{name}` à l'intérieur d'un élément `div`. De la même manière, nous incluons un élément HTML qui a été directement affecté à la variable `svg`.

Contrairement à certains autres frameworks qui utilisent JSX, Solid tente de rester aussi proche que possible des normes HTML, permettant le copier-coller des réponses sur Stack Overflow ou des générateurs de template de vos designers.

Il existe 3 différences principales entre JSX et HTML qui empêchent JSX d'être considéré comme un sur-ensemble de HTML:
1. JSX n'a ​​pas d'éléments vides. Cela signifie que tous les éléments doivent avoir une balise de fermeture ou une fermeture automatique. Gardez cela à l'esprit lorsque vous copiez des éléments tels que `<input>` ou `<br>`.
2. JSX doit renvoyer un seul Élément. Pour représenter plusieurs éléments de niveau supérieur, utilisez un élément `Fragment`:
   ```jsx
   <>
     <h1>Titre</h1>
     <p>Un petit texte.</p>
   </>
   ```
3. JSX ne prend pas en charge les commentaires HTML `<!--...-->` ou les balises spéciales telles que `<!DOCTYPE>`.

Mais JSX prend en charge SVG. Essayons de copier du SVG directement dans notre composant:
```jsx
<svg height="300" width="400">
  <defs>
    <linearGradient id="gr1" x1="0%" y1="60%" x2="100%" y2="0%">
      <stop offset="5%" style="stop-color:rgb(255,255,3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <ellipse cx="125" cy="150" rx="100" ry="60" fill="url(#gr1)" />
  Désolé mais ce navigateur ne supporte pas le SVG en ligne.
</svg>
```
