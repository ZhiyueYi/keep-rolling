<script>
  import { rolling } from './../store';

  function handleClickStart() {
    rolling.set(true);
  }

  function handleClickStop() {
    rolling.set(false);
  }
</script>

<style>

</style>

<div>
  {#if $rolling}
    <button on:click={handleClickStop}>Stop</button>
  {:else}
    <button on:click={handleClickStart}>Start</button>
  {/if}
</div>
