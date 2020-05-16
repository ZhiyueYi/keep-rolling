<script>
  import { rolling } from './../store';

  function handleClickStart() {
    rolling.set(true);
  }

  function handleClickStop() {
    rolling.set(false);
  }
</script>

<div>
  {#if $rolling}
    <button class="button is-warning is-fullwidth" on:click={handleClickStop}>
      Stop
    </button>
  {:else}
    <button class="button is-success is-fullwidth" on:click={handleClickStart}>
      Start
    </button>
  {/if}
</div>
