<script>
  import Roller from './components/Roller.svelte';
  import Settings from './components/Settings.svelte';
  import Control from './components/Control.svelte';
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 1000px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .roller {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .setting-panel {
  }
</style>

<main>
  <div class="roller">
    <Roller />
    <Control />
  </div>
  <div class="setting-panel">
    <Settings />
  </div>
</main>
