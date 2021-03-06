import React, { useEffect, useState, useRef } from 'react';
import Vote from '../vote/Vote'
import { Col, Row, Modal, Badge, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, Button } from 'reactstrap';
import CommentWrapper from '../comment/CommentWrapper'
import { returnValueOrEmpty } from '../shared/returnValueOrEmpty';
import moment from 'moment';
import { useAuth } from '../../../../App';
import DeleteModal from '../shared/DeleteModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import TopicsDropdown from '../shared/TopicsDropdown';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { ToastError } from '../shared/Toast'
import { deletePost, triggerSearchOn as triggerSearchPostOn, editPost } from "../../../actions/Posts";
import { triggerSearchOn as triggerSearchUserOn } from "../../../actions/User";
import { triggerFetchOn as triggerFetchCommentsOn } from "../../../actions/Comments";
import {useHistory} from 'react-router-dom';
import { connect } from "react-redux";
import { mapTopicColor } from '../shared/BadgeTopicColor';

const PostDetail = (props) => {
    const history = useHistory();
    const editForm = useRef();
    const { post, postUpdateSuccess } = props;
    const [comments, setComments] = useState([]);
    const { user } = useAuth();
    const [deleteModal, setDeleteModal] = useState(false);
    const [actionDropdown, setActionDropdown] = useState(false);
    const [defaultTopic, setDefaultTopic] = useState({
        label: '',
        value: ''
    })
    const [editFormDisplay, setEditFormDisplay] = useState(false);
    const [userIntent, setUserIntent] = useState(undefined)

    const toggleDeleteModal = () => setDeleteModal(!deleteModal);
    const deleteModalVisible = () => {
        setDeleteModal(!deleteModal);
    };
    const toggleActionDropdown = () => setActionDropdown(prevState => !prevState);

    useEffect(() => {
        if (post?.topic) {
            setDefaultTopic({ ...defaultTopic, label: post.topic.name, value: post.topic.id })
        }
    }, [post?.topic])

    useEffect(() => {
        if (post?.comments?.length) {
            setComments(post.comments)
        }
    }, [post?.comments])

    const onTopicsChange = (e) => {
        if (e) {
            setDefaultTopic(e);
        } else {
            setDefaultTopic(undefined);
        }
    }
    const clearForm = () => {
        editForm.current.reset();
    }
    const handleEditPost = (event, errors, value) => {
        if (!defaultTopic) {
            ToastError("Vui l??ng ch???n ch??? ????? cho b??i ????ng");
            return
        }
        if (!errors.length) {
            setUserIntent("EDIT_POST");
            value.id = post.id
            value.topic_id = defaultTopic.value
            props.editPost(value);

        }
    }
    const handleDeletePost = () => {
        setUserIntent("DELETE_POST");
        props.deletePost(post.id)
    }
    const handleUserIntent = () => {
        switch (userIntent) {
            case "DELETE_POST":
                props.triggerSearchPostOn();
                setDeleteModal(false);
                props.toggle();
                // ToastSuccess("X??a b??i ????ng th??nh c??ng")
                break;
            case "EDIT_POST":
                props.triggerSearchPostOn();
                props.triggerSearchUserOn();
                setEditFormDisplay(false);
                props.triggerFetchCommentsOn();
                clearForm();
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (postUpdateSuccess && props.modal) {
            handleUserIntent();
            setUserIntent(undefined);
        }
    }, [postUpdateSuccess])

    const handleRedirect = inputId => {
        if (inputId === user?.id) {
            history.push('/current');
        } else {
            history.push(`/user/${inputId}`);
        }
    }

    return (
        <Modal className="m-3" isOpen={props.modal} toggle={() => props.toggle()} className="postDetailModal">
            <DeleteModal
                toggle={toggleDeleteModal}
                modal={deleteModal}
                prompt="X??c nh???n xo?? b??i ????ng n??y?"
                handleComfirm={handleDeletePost}
            />

            <Container className={editFormDisplay ? 'p-3' : 'd-none'}>
                <Row className="m-3">
                    <Col xs="12" className="text-center">
                        <h3 className="lead">Ch???nh s???a b??i ????ng </h3>
                    </Col>
                    <Col xs="12">
                        <TopicsDropdown
                            onTopicsChange={onTopicsChange}
                            isMultiple={false}
                            defaultOption={defaultTopic}
                        />
                    </Col>
                </Row>
                <Row className="m-3">
                    <Col xs="12">
                        <AvForm
                            onSubmit={handleEditPost}
                            ref={editForm}
                        >
                            <AvField name="title" label="Ti??u ?????"
                                value={post?.title}
                                validate={{
                                    required: { value: true, errorMessage: 'Vui l??ng nh???p ti??u ????? b??i ????ng' },
                                    minLength: { value: 10, errorMessage: 'Ti??u ????? b??i ????ng ch???a ??t nh???t 10 k?? t???' },
                                    maxLength: { value: 255, errorMessage: 'Ti??u ????? b??i ????ng ch???a kh??ng qu?? 255 k?? t???' },
                                }}

                            />
                            <AvField name="content" label="N???i dung" type="textarea"
                                value={post?.content}
                                className="post_textAreaContent"
                                validate={{
                                    required: { value: true, errorMessage: 'Vui l??ng nh???p n???i dung b??i ????ng' },
                                    minLength: { value: 10, errorMessage: 'N???i dung b??i ????ng ch???a ??t nh???t 10 k?? t???' },
                                }}
                            />

                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <Button type="reset"
                                    onClick={() => setEditFormDisplay(false)}
                                    color="light">
                                    <span>H???y</span>
                                </Button>
                                <Button type="submit" className="replyButton" color="primary">
                                    <span>Ch???nh s???a</span>
                                </Button>
                            </div>
                        </AvForm>
                    </Col>
                </Row>

            </Container>

            <Col xs="12" className={editFormDisplay ? 'd-none' : 'p-3'}>
                <Row>
                    <Col xs="1" className="m-auto mt-3">
                        <Vote
                            totalVote={post?.post_votes}
                            postId={post?.id}
                        />
                    </Col>
                    <Col xs="11" className="mt-5">
                        <Row className="d-flex justify-content-between">
                            <Col xs="11" className="mb-3">
                                <p className="font-weight-bold">
                                    {post?.title}
                                </p>
                               {/* <div className="d-flex"> */}
                                    {/* <Avatar src={mapAvatar[post?.user.avatar]} /> */}

                                    <p className="text-muted font-italic cursor-pointer-text"  onClick={() => handleRedirect(post?.user.id)}>
                                        {`${post?.user.fname} ${post?.user.lname}`}
                                    </p>
                               {/* </div> */}
                         
                            </Col>
                            <Col xs="1" className="text-center">
                                <Dropdown isOpen={actionDropdown}
                                    className={post?.user_id === user?.id ? "ml-auto" : "d-none"}
                                    toggle={toggleActionDropdown}>
                                    <DropdownToggle className="DropdownToggle" color="light">
                                        <FontAwesomeIcon icon={faEllipsisV} color="#333333" size="xs" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => deleteModalVisible()}>
                                            <FontAwesomeIcon icon={faTrash} className="mr-3 deleteIcon" />
                                            <span className="text-muted">Xo?? b??i</span>
                                        </DropdownItem>
                                        <DropdownItem onClick={() => setEditFormDisplay(true)}>
                                            <FontAwesomeIcon icon={faEdit} className="mr-3 editIcon" />
                                            <span className="text-muted">S???a b??i</span>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </Col>
                        </Row>
                        <p >
                            {returnValueOrEmpty(post?.content)}
                        </p>
                    </Col>
                    <Col xs="11" className="ml-auto d-flex justify-content-between">
                        {/* <Badge color="primary">Ch??? ????? 1</Badge> */}
                        <Badge color={mapTopicColor[post?.topic?.color]}>{post?.topic?.name}</Badge>
                        <small className="font-italic ">
                            {moment(returnValueOrEmpty(post?.created_at)).format('DD/M/YYYY, HH:mm')}
                        </small>
                    </Col>
                </Row>
            </Col>
            <Col xs="11" className={editFormDisplay ? 'd-none' : 'ml-auto'}>
                <CommentWrapper comments={comments} postId={post?.id} />
            </Col>
        </Modal>
    )
}
const mapStateToProps = state => {
    return {
        postUpdateSuccess: state.post.updateSuccess,
        shouldSearchPostEntities: state.post.shouldSearchEntities
    }
}
const mapDispatchToProps = {
    deletePost,
    triggerSearchPostOn,
    editPost,
    triggerFetchCommentsOn,
    triggerSearchUserOn
}
export default connect(mapStateToProps, mapDispatchToProps)(PostDetail);