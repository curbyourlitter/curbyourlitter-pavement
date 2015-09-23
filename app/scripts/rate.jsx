import moment from 'moment';
import 'moment-timezone';
import React from 'react';
import { connect } from 'react-redux';

import { ratingsRequireReload } from './actions';

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

var PreviousRatings = React.createClass({
    render: function () {
        var ratingsList,
            average;
        if (this.props.ratings) {
            var ratings = this.props.ratings;
            ratingsList = ratings.map(rating => {
                return <PreviousRating key={rating.cartodb_id} {...rating}/>
            });

            average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            if (average) {
                average = Math.round(average * 10) / 10.0;
            }
            else {
                average = 0;
            }
        }

        return (
            <div className="rating-previous">
                <h2>previously</h2>
                <div>rated {this.props.ratings ? this.props.ratings.length : 0} times, average {average}:</div>
                <ul>{ratingsList}</ul>
            </div>
        );
    }
});

var PreviousRating = React.createClass({
    render: function () {
        return (
            <li className="rating-previous-item">
                {this.props.rating} on {moment(this.props.collected).tz('GMT').format('M/D/YYYY')}
            </li>
        );
    }
});

var previousRatingsContainer = function (Component) {
    return React.createClass({
        getInitialState: function () {
            return {};
        },

        componentDidMount: function () {
            this.getRatings(this.props.streetId);
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.props.streetId !== nextProps.streetId) {
                this.getRatings(nextProps.streetId);
            }
        },

        getRatings: function (id) {
            this.setState({ id: id });
            cartodbSql.execute('SELECT * FROM {{ table }} WHERE segment_id = {{ id }}', {
                id: id,
                table: 'street_ratings'
            })
                .done((data) => {
                    this.setState({ ratings: data.rows });
                });
        },

        reload: function () {
            this.getRatings(this.props.streetId);
        },

        render: function () {
            return (
                <Component {...this.state} />
            );
        }
    });
};

var PreviousRatingsContainer = previousRatingsContainer(PreviousRatings);

var AddRating = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        cartodbSql.execute("INSERT INTO {{ table }} (segment_id, rating, collected, recorded_by, comments) VALUES ({{ segmentId }}, {{ rating }}, '{{ collected }}', '{{ collectedBy }}', '{{ comments }}')", {
            collected: this.state.collected,
            collectedBy: this.state.collectedBy,
            comments: this.state.comments,
            rating: this.state.rating,
            segmentId: this.props.streetId,
            table: 'street_ratings'
        }, { api_key: ratingsConfig.cartodbApiKey })
            .done(data => {
                this.success();
                this.props.onSuccess();
            })
            .error(error => {
                this.failure();
            });
    },

    isValid: function () {
        return (this.state.collected !== null && this.state.rating !== null && this.state.rating >= 1 && this.state.rating <= 5);
    },

    updateField: function (name, value) {
        var updates = {};
        updates[name] = value;
        this.setState(updates, () => {
            this.setState({ valid: this.isValid() });
        });
    },

    success: function () {
        var newState = this.getInitialState();
        newState.message = 'Success!';
        this.setState(newState);
    },

    failure: function () {
        this.setState({ message: 'We failed to add your rating. Try again and let us know if the problem persists.' });
    },

    getInitialState: function () {
        return {
            collected: moment().format('YYYY-MM-DD'),
            collectedBy: null,
            comments: null,
            message: null,
            rating: null,
            valid: false
        };
    },

    render: function () {
        return (
            <form className="rating-add" onSubmit={this.handleSubmit}>
                <h2>add another rating</h2>
                {(() => {
                    if (this.state.message) {
                        return <div>{this.state.message}</div>;
                    }
                })()}
                <div>
                    <label htmlFor="rating">rating</label>
                    <input type="number" name="rating" onChange={(e) => this.updateField('rating', e.target.value)} value={this.state.rating} />
                </div>
                <div>
                    <label htmlFor="collected">collected</label>
                    <input type="date" name="collected" onChange={(e) => this.updateField('collected', e.target.value)} value={this.state.collected} />
                </div>
                <div>
                    <label htmlFor="collected_by">collected by</label>
                    <input type="text" name="collected_by" onChange={(e) => this.updateField('collectedBy', e.target.value)} value={this.state.collectedBy} />
                </div>
                <div>
                    <label htmlFor="comments">comments</label>
                    <textarea name="comments" onChange={(e) => this.updateField('comments', e.target.value)} value={this.state.comments} />
                </div>
                <input type="submit" disabled={!this.state.valid}/>
            </form>
        );
    }
});

export var Rate = connect()(React.createClass({
    onAddSuccess: function () {
        this.refs.previousRatings.reload();
        this.props.dispatch(ratingsRequireReload(true));
    },

    render: function () {
        return (
            <div className="rating-panel">
                <PreviousRatingsContainer ref="previousRatings" streetId={this.props.params.id}/>
                <AddRating streetId={this.props.params.id} onSuccess={this.onAddSuccess}/>
            </div>
        );
    }
}));
