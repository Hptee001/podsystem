<template>
    <TheContainer />
</template>

<script>
import TheContainer from "~/components/TheContainer";

export default {
    name: "full",
    middleware: 'auth',
    components: {
        TheContainer
    }
};
</script>