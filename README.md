# A Little Birthday Magic

A no-build, responsive birthday surprise made with plain HTML, CSS, and JavaScript. It runs locally in a browser and does not need a framework or package install.

## Run it

Open `index.html` in a current browser. If your browser restricts local files, start a small server from this folder instead:

```powershell
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Make it yours

Edit `birthday-config.js`:

- `name`: replaces “Your Birthday Girl” in the greeting and portrait caption.
- `photo`: optional relative path to her photo, such as `"assets/her-photo.jpg"`. Create an `assets` folder and copy the photo there. Leave this blank to use the built-in illustrated portrait. If the photo cannot load, the illustration stays in place.
- `message`: the main birthday letter. Use `\n\n` for a new paragraph.
- `extraLove`: the message revealed by “A little more love”.
- `colors`: change the rose, lavender, sky, and ink accent colors with CSS hex values.
- `music.src`: leave empty for the gentle synthesized instrumental, or set a local audio path such as `"assets/our-song.mp3"`. The music only starts after the visitor presses the music button. If a selected file is missing, the site falls back to the synthesized music.

The editable illustration lives in the `.portrait-art` SVG in `index.html`; replace that SVG if you would rather use a custom illustration. The photo setting is the easiest way to use a real picture.

## Interactions

Open the gift by clicking it or its button. After the reveal, visitors can tap the small hearts and star for hidden notes, reveal another love note, tap each candle to blow it out, turn music on or off, celebrate again, and finish on the birthday wish screen. Celebration effects are drawn on one temporary canvas, and the page honors reduced-motion preferences.
