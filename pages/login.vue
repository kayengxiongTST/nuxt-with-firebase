<template>
  <div>
    <v-dialog v-model="dialog" max-width="350">
      <v-card class="pt-10">
        <div class="text-center">
          <v-avatar size="200">
            <v-img
              src="https://picsum.photos/300/300"
              max-height="300"
              contain
            ></v-img>
          </v-avatar>
        </div>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <span>Username</span>
              <v-text-field
                label="Username"
                single-line
                dense
                hide-details="auto"
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <span>Password</span>
              <v-text-field
                label="Password"
                type="password"
                dense
                hide-details="auto"
                outlined
                single-line
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <div class="text-right">
            <span>Forget</span>
            <span class="primary--text text-decoration-underline"
              >Password</span
            >
          </div>
          <div class="mt-4 d-flex justify-space-between">
            <v-btn color="primary">
              <v-icon left>mdi-login</v-icon>
              Login
            </v-btn>
            <v-btn color="error" text @click="$router.go(-1)">Cancel</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dialog: true,
    };
  },
};
</script>
