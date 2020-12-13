import {mount, createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Posts from "../../src/components/Posts.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

//Create dummy store
const store = new Vuex.Store({
    state: {
        user: {
            id: 1,
            firstname: 'test',
            lastname: 'test',
            email: 'test',
            avatar: 'test',
        }
    },
    getters: {
        user: (state) => state.user,
    }
});

//Create dummy routes
const routes = [
    {
        path: '/',
        name: 'posts',
    },
    {
        path: '/profiles',
        name: 'profiles'
    }
];

const router = new VueRouter({routes});

const testData = [
    {
        id: 1,
        text: "I think it's going to rain",
        createTime: "2020-12-05 13:53:23",
        likes: 0,
        liked: false,
        media: {
            url: "test-image.jpg",
            type: "image"
        },
        author: {
            id: 2,
            firstname: "Gordon",
            lastname: "Freeman",
            avatar: 'avatar.url'
        }
    },
    {
        id: 2,
        text: "Which weighs more, a pound of feathers or a pound of bricks?",
        createTime: "2020-12-05 13:53:23",
        likes: 1,
        liked: true,
        media: null,
        author: {
            id: 3,
            firstname: "Sarah",
            lastname: "Connor",
            avatar: 'avatar.url'
        }
    },
    {
        id: 4,
        text: null,
        createTime: "2020-12-05 13:53:23",
        likes: 3,
        liked: false,
        media: {
            url: "test-video.mp4",
            type: "video"
        },
        author: {
            id: 5,
            firstname: "Richard",
            lastname: "Stallman",
            avatar: 'avatar.url'
        }
    },
];

//Mock axios.get method that our Component calls in mounted event
jest.mock("axios", () => ({
    get: () => Promise.resolve({
        data: testData
    })
}));

describe('Posts', () => {

    const wrapper = mount(Posts, {router, store, localVue});

    it('1 == 1', function () {
        expect(true).toBe(true)
    });

    it("renders 3 posts", function () {
        let posts = wrapper.findAll( ".post");
        expect(posts.length).toBe(3);
    });

    it("should include 'img' tag when rendering post with media type 'image'", function () {
        let firstPost = wrapper.findAll(".post").at(0);
        expect(firstPost.get(".post-image").get("img").exists()).toBe(true);
    });

    it("should include 'video' tag when rendering post with media type 'video'", function () {
        let thirdPost = wrapper.findAll(".post").at(2);
        expect(thirdPost.get(".post-image").get("video").exists()).toBe(true);
    });

    it("should not 'img' and 'video' tags when rendering post with media type null", function () {
        let secondPost = wrapper.findAll(".post").at(1);
        expect(secondPost.find(".post-image").exists()).toBe(false);
    });

    it("should display post creation time in correct format", function() {
        let firstPostCreationTime = wrapper.findAll(".post").at(0)
            .find(".post-author")
            .findAll("small").at(1).text();
        expect(firstPostCreationTime).toBe("Saturday, December 5, 2020 3:53 PM");
    });

    it("should display the correct number of likes", function () {
        let thirdPostLikesAmount = wrapper.findAll(".post").at(2)
            .find(".post-actions")
            .find(".like-button").text();
        expect(thirdPostLikesAmount).toBe("+ 3");
    });

    it("should have class 'liked' on liked posts", function () {
        let secondPostLikeButton = wrapper.findAll(".post").at(1)
            .find(".post-actions")
            .find(".like-button");
        expect(secondPostLikeButton.find(".liked").exists()).toBe(true);
    })
});