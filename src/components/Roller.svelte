<script>
  import { settings, rolling, activeItem } from './../store';
  import { rollingWithProbMap, generateProbMap } from './../utils';
  let rollingInterval;
  let probMap = [];

  settings.subscribe(setting => {
    probMap = generateProbMap(setting.rollingItems);
  });

  rolling.subscribe(isRolling => {
    if (isRolling) {
      rollingInterval = setInterval(() => {
        const activeIndex = rollingWithProbMap($settings.rollingItems, probMap);
        activeItem.set(activeIndex);
      }, 50);
    } else {
      clearInterval(rollingInterval);
    }
  });
</script>

<style>
  .rolling-item {
    max-width: 200px;
  }
  .card {
    height: 100%;
  }
  .card-flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .card.is-dark {
    background-color: #4a4a4a;
    color: white;
  }
</style>

<div class="columns is-centered is-multiline is-mobile">
  {#each $settings.rollingItems as item, index (item.label)}
    <div class="column is-one-quarter-mobile rolling-item">
      <div
        class="card"
        class:card-flex-center={!item.imageUrl}
        class:is-dark={$activeItem === index}>
        {#if item.imageUrl}
          <div class="card-image">
            <figure class="image is-4by3">
              <img
                src="https://bulma.io/images/placeholders/1280x960.png"
                alt="Placeholder image" />
            </figure>
          </div>
        {/if}
        {#if item.label}
          <div class="card-content">
            <div class="content">
              <p class="is-text-medium">{item.label}</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
