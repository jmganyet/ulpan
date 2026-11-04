import { render } from 'preact'
import '@phosphor-icons/web/duotone'
import './estil/base.css'
import './estil/components.css'
import { App } from './app'

render(<App />, document.getElementById('app')!)

// Quan una versió nova de l'app pren el control (després d'una actualització, no a la primera
// instal·lació), es recarrega la pàgina perquè no quedi la versió antiga en pantalla.
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let recarregat = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recarregat) return
    recarregat = true
    location.reload()
  })
}
