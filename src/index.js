/**
 * External dependencies
 */
import chalk from 'chalk';
import cli from 'commander';
import Client from '@octokit/rest';
import Promise from 'bluebird';
import read from 'read';
import Table from 'cli-table';

/**
 * Internal dependencies
 */
import * as pkg from '../package.json';

const colorScheme = {
	success: chalk.green,
	info: chalk.white,
	warning: chalk.yellow,
	error: chalk.red,
	debug: chalk.blue
};

function main() {
	setupCommand();
	watch();
}

function setupCommand() {
	cli
		.version( pkg.version )
		.option( '-t, --token <token>', 'GitHub token' )
		.option( '-o, --organization <organization>', 'GitHub organization' )
		.parse( process.argv );
}

function clientPromise( token ) {
	return new Promise( ( resolve, reject ) => {
		try {
			const client = getClient( token );
			resolve( client );
		} catch ( e ) {
			reject( e );
		}
	} );
}

function getClient( token ) {
	const client = new Client( {
		debug: false,
		Promise: Promise
	} );

	client.authenticate( {
		type: 'token',
		token: token,
	} );

	return client;
}

function watch() {
	const { token, organization } = cli;
	if ( ! token ) {
		return error( '  Missing token. Please specify with `-t <token>`.' ) & cli.help();
	}
	if ( ! organization ) {
		return error( '  Missing organization. Please specify with `-o <organization>`.' ) & cli.help();
	}

	const getOrgRepos = client => {
		const pager = getPager( client, organization );

		info( `Fetching ${ organization } repos..` );

		// eslint-disable-next-line camelcase
		return client.repos.getForOrg( { org: organization, page: 1, per_page: 100 } )
			.then( pager );
	};

	const subscribe = res => {
		if ( ! res.repos.length ) {
			return success( 'Nothing to watch.' );
		}

		res.repos.forEach( repo => {
			const sub = {
				owner: organization,
				repo: repo.name,
				subscribed: true
			};
			res.client.activity.setRepoSubscription( sub )
				.then( () => {
					return success( `Watched ${ repo.full_name } successfully` );
				} )
				.catch( err => {
					const resp = JSON.parse( err.message );
					return error( `Failed to watch ${ repo.full_name }: ${ resp.message }` );
				} );
		} );
	};

	return clientPromise( token )
		.then( getOrgRepos )
		.then( promptSubscribe )
		.then( subscribe )
		.catch( error );
}

function getPager( gh, organization ) {
	let repos = [];

	const pager = res => {
		repos = repos.concat( res.data );
		if ( gh.hasNextPage( res ) ) {
			return gh.getNextPage( res )
				.then( pager );
		}

		return {
			client: gh,
			repos: repos.filter( repo => {
				return repo.owner.login === organization;
			} )
		};
	};

	return pager;
}

function promptSubscribe( res ) {
	if ( ! res.repos.length ) {
		return res;
	}

	const table = new Table( {
		head: [ 'Repo', 'Description' ],
		colWidths: [ 20, 60 ]
	} );
	res.repos.forEach( repo => {
		table.push( [ repo.name, repo.description ? repo.description : '' ] );
	} );
	info( table );

	return promptPromise( res, `Found ${ res.repos.length } repos. Watch those?` );
}

function promptPromise( res, message ) {
	const prompt = Promise.promisify( read );
	const args = {
		prompt: message,
		'default': 'yes'
	};
	const proceed = answer => {
		const cancel = ! answer || 'y' !== answer.toLowerCase().charAt( 0 );
		return new Promise( ( resolve, reject ) => {
			cancel ? reject( new Error( 'Aborted.' ) ) : resolve( res );
		} );
	};

	return prompt( args )
		.then( proceed );
}

function success( ...args ) {
	log( 'success', ...args );
}

function info( ...args ) {
	log( 'info', ...args );
}

function error( ...args ) {
	log( 'error', ...args );
}

function log( scheme, ...args ) {
	// eslint-disable-next-line no-console
	console.log( ...args.map( arg => colorScheme[ scheme ]( arg ) ) );
}

main();
