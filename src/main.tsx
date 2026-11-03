import { render } from 'preact'
import '@phosphor-icons/web/duotone'
import '@phosphor-icons/web/regular'
import './estil/base.css'
import './estil/components.css'
import { App } from './app'

render(<App />, document.getElementById('app')!)
