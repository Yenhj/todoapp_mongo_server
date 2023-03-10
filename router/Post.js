// Todo 를 위한 라우터
let express = require("express");
let router = express.Router();

// Todo 모델을 가지고 온다.
const { Todo } = require("../model/TodoModel");

// User 모델 내용 참조.
const { User } = require("../model/UserModel");

// 할일 등록
router.post("/submit", (req, res) => {
  // console.log(req.body);
  let temp = {
    id: req.body.id,
    title: req.body.title,
    completed: req.body.completed,
    uid: req.body.uid,
    // 여기서 바로 author를 저장할 수 없다.
    // UserModel 에서 uid 이용해
    // ObjectId 를 알아내고 .. 내용을 복사해야함
    // author :{}에 값을 넣을 수 0
  };
  // UserModel 에서 req.body.uid 로 받은 값을
  // 이용해서 자료를 추cncnf한다.
  User.findOne({ uid: req.body.uid })
    .exec()
    .then((userInfo) => {
      // User 모델의 ObjectId 를 저장
      temp.author = userInfo._id;
      // 실제 Post Model 업데이트
      const todoPost = new Todo(temp);
      todoPost
        .save()
        .then(() => {
          // console.log(todoPost);
          res.status(200).json({ success: true });
        })
        .catch((err) => {
          res.status(400).json({ success: false });
        });
    })
    .catch((err) => console.log(err));
});

// 목록 읽어오기
router.post("/list", (req, res) => {
  // console.log("전체목록 호출");
  let sort = {};
  if (req.body.sort === "최신순") {
    sort = { id: -1 };
  } else {
    sort = { id: 1 };
  }
  Todo.find({ title: new RegExp(req.body.search), uid: req.body.uid })
    .populate("author")
    .sort(sort)
    .skip(req.body.skip) //0~4, 5~9, 10~14
    .limit(5)
    .exec()
    .then((doc) => {
      // 총 카운트를 하여서 버튼 출력 여부 결정
      Todo.count({
        title: new RegExp(req.body.search),
        uid: req.body.uid,
      })
        .then((number) => {
          // console.log(number);
          res.status(200).json({ success: true, initTodo: doc, total: number });
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ success: false });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ success: false });
    });
});

// 할일의 completed 를 업데이트
router.post("/updatetoggle", (req, res) => {
  let temp = {
    completed: req.body.completed,
  };
  console.log(req.body);
  // mongoose 문서 참조
  Todo.updateOne({ id: req.body.id }, { $set: temp })
    .exec()
    .then(() => {
      console.log("completed 업데이트 완료");
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ success: false });
    });
});

// 타이틀 업데이트
router.post("/updatedtitle", (req, res) => {
  let temp = {
    title: req.body.title,
  };
  console.log(req.body);
  Todo.updateOne({ id: req.body.id }, { $set: temp })
    .exec()
    .then(() => {
      console.log("title 업데이트 완료");
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ success: false });
    });
});

// 할일 삭제
router.post("/delete", (req, res) => {
  console.log(req.body);
  Todo.deleteOne({ id: req.body.id })
    .exec()
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ success: false });
    });
});

//  전체 할일 삭제
router.post("/deleteall", (req, res) => {
  Todo.deleteMany()
    .exec()
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ success: false });
    });
});

// 사용자 제거
router.post("/userout", (req, res) => {
  console.log("사용자 삭제 ", req.body);
  // mongoose 문서참조
  User.deleteOne({ uid: req.body.uid })
    .exec()
    .then(() => {
      console.log("사용자 삭제 성공!!!");
      // 실제 Post Model 삭제
      Todo.deleteMany({ uid: req.body.uid })
        .then(() => {
          // console.log("기록물 삭제 성공!!!");
          res.status(200).json({ success: true });
        })
        .catch((err) => {
          // 데이터 저장이 실패한 경우
          console.log(err);
          res.status(400).json({ success: false });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
