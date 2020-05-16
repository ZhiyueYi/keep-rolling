<script>
  import { settings, rolling, activeItem } from './../store';
  let rollingInterval;

  rolling.subscribe(isRolling => {
    if (isRolling) {
      rollingInterval = setInterval(() => {
        const activeIndex = Math.floor(
          Math.random() * ($settings.rollingItems.length || 0),
        );
        activeItem.set(activeIndex);
      }, 50);
    } else {
      clearInterval(rollingInterval);
    }
  });
</script>

<style>
  .wrapper {
    display: flex;
    width: 100%;
  }
  .item {
    height: 40px;
    width: 60px;
    padding: 10px;
    margin: 5px 2px;
    border: 1px solid lightgrey;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .active {
    background: lightgrey;
  }
</style>

<div class="wrapper">
  {#each $settings.rollingItems as item, index (item.label)}
    <div class="item" class:active={$rolling && $activeItem === index}>
      {item.label}
    </div>
  {/each}
</div>
