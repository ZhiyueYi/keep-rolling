<script>
  import './../node_modules/bulma/css/bulma.css';
  import Roller from './components/Roller.svelte';
  import Settings from './components/Settings.svelte';
  import Control from './components/Control.svelte';
</script>

<style>
  main {
    width: 90%;
    margin: auto;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.8);
  }
</style>

<main>
  <h1 class="title has-text-centered">Keep Rolling!</h1>
  <div class="columns">
    <div class="column is-half is-full-tablet">
      <Roller />
      <Control />
    </div>
    <div class="column is-half is-full-tablet">
      <Settings />
    </div>
  </div>

</main>
