<template>
  <div>
    <v-card flat max-width="1200" class="mx-auto" color="transparent">
      <v-card-title>
        Search Engine System
        <v-spacer></v-spacer>
        <v-icon @click="$router.push('/login')"> mdi-account </v-icon>
      </v-card-title>
      <v-card-text>
        <span class="text-subtitle-1 font-weight-bold">You can search...</span>
        <v-row>
          <v-col cols="12" md="6">
            <v-combobox
              label="Search Here"
              placeholder="Type what you wanna search"
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              :items="searchList"
              single-line
            ></v-combobox>
          </v-col>
          <v-col>
            <v-btn color="primary">Search now</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-card flat>
              <v-card-title>Frequency Questions</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col v-for="item in posts" :key="item.id" cols="12">
                    <v-card flat outlined>
                      <v-card-title>{{ item.title }}</v-card-title>
                      <v-card-subtitle> 12 Dec 2023, 23:00:00 </v-card-subtitle>
                      <v-card-text>
                        Lorem, ipsum dolor sit amet consectetur adipisicing
                        elit. Corrupti provident error nulla inventore quos
                        exercitationem laborum amet delectus ratione aspernatur
                        iste velit a totam facere magnam, id expedita culpa.
                        Sequi!
                      </v-card-text>
                      <v-card-text>
                        <v-img
                          src="https://picsum.photos/1500/300"
                          max-height="300"
                          contain
                        ></v-img>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-dialog v-model="newQuestion" max-width="450" persistent>
        <v-card>
          <v-card-title>Add new question</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <span>Enter your title</span>
                <v-text-field
                  v-model="form.title"
                  dense
                  hide-details="auto"
                  single-line
                  outlined
                  placeholder="Question title"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <span>Enter link</span>
                <v-text-field
                  v-model="form.link"
                  dense
                  hide-details="auto"
                  single-line
                  outlined
                  placeholder="Question link"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <span>Enter description</span>
                <v-textarea
                  v-model="form.description"
                  dense
                  hide-details="auto"
                  single-line
                  outlined
                  placeholder="Description"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text>
            <v-btn color="primary" class="px-5" @click="onCreate"> POST </v-btn>
            <v-btn color="error" class="px-5" text @click="newQuestion = false">
              Close
            </v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
      <div style="position: fixed; top: 55%; right: 10px">
        <v-btn fab color="primary" @click="showDialog = !showDialog">
          <v-icon>mdi-forum</v-icon>
        </v-btn>
      </div>
      <div style="position: fixed; top: 65%; right: 10px">
        <v-btn fab color="primary" @click="newQuestion = !showDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-card>
    <v-fab-transition style="z-index: 100">
      <div
        v-if="showDialog"
        style="
          width: 300px;
          position: fixed;
          right: 100px;
          top: 12%;
          z-index: 100;
        "
      >
        <v-card elevation="1" style="position: relative">
          <div style="position: absolute; right: 10px; top: 10px">
            <v-btn small icon @click="showDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-card-title>Question</v-card-title>
          <v-card-text>
            <div class="text-subtitle-1">Username</div>
            <div style="height: 250px; overflow-y: scroll">
              <div>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
                asperiores optio a repudiandae exercitatione
              </div>
              <div>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
                asperiores optio a repudiandae exercitatione
              </div>
              <div>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
                asperiores optio a repudiandae exercitatione
              </div>
              <div>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
                asperiores optio a repudiandae exercitatione
              </div>
              <div>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
                asperiores optio a repudiandae exercitatione
              </div>
              <div>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
                asperiores optio a repudiandae exercitatione
              </div>
              <div>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
                asperiores optio a repudiandae exercitatione
              </div>
            </div>
            <div class="mt-3">
              <v-text-field
                label="Message"
                placeholder="Enter your question?"
                dense
                hide-details="auto"
                outlined
              ></v-text-field>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-fab-transition>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      showDialog: false,
      newQuestion: false,
      searchList: ["How to use array", "How to get JS", "How to learn VueJS"],
      form: {},
      posts: [],
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async onCreate() {
      await this.$fire.firestore.collection("posts").add(this.form);
      await this.getData();
      this.newQuestion = false;
    },
    async getData() {
      const db = this.$fire.firestore;
      const list = [];
      await db
        .collection("posts")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            list.push({
              id: doc.id,
              ...doc.data(),
            });
          });
        });
      this.posts = list;
    },
  },
};
</script>
