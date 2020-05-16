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
  <button on:click={handleClickStart}>Start</button>
  <button on:click={handleClickStop}>Stop</button>
</div>
