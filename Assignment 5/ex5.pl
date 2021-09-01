:- module('ex5',
        [author/2,
         genre/2,
         book/4
        ]).

/*
 * **********************************************
 * Printing result depth
 *
 * You can enlarge it, if needed.
 * **********************************************
 */
maximum_printing_depth(100).
:- current_prolog_flag(toplevel_print_options, A),
   (select(max_depth(_), A, B), ! ; A = B),
   maximum_printing_depth(MPD),
   set_prolog_flag(toplevel_print_options, [max_depth(MPD)|B]).



author(1, "Isaac Asimov").
author(2, "Frank Herbert").
author(3, "William Morris").
author(4, "J.R.R Tolkein").


genre(1, "Science").
genre(2, "Literature").
genre(3, "Science Fiction").
genre(4, "Fantasy").

book("Inside The Atom", 1, 1, 500).
book("Asimov's Guide To Shakespeare", 1, 2, 400).
book("I, Robot", 1, 3, 450).
book("Dune", 2, 3, 550).
book("The Well at the World's End", 3, 4, 400).
book("The Hobbit", 4, 4, 250).
book("The Lord of the Rings", 4, 4, 1250).

% Signature: empty(lst) /1
% Purpose: check if lst is empty.
empty([]).

% Signature: len(lst, N) /2
% Purpose: get the length of the list {lst}.
len([], 0).
len([_X|Xs], N+1) :- len(Xs, N).

% Signature: authorOfGenre(GenreName, AuthorName) /2
% Purpose: check if the author with name {AuthorName} has written a book in the genre {GenreName}.
authorOfGenre(GenreName, AuthorName) :- 
        author(AuthorID, AuthorName), 
        book(_, AuthorID, GenreID, _), 
        genre(GenreID, GenreName).

% Signature: longestBook(AuthorId, BookName) /2
% Purpose: check if the book with name {BookName} is the longest book written by the author with name {AuthorName}
longestBook(AuthorId, BookName) :- 
        book(BookName, AuthorId, _, Length), 
        findall(X, (book(_, AuthorId, _, X), X > Length), AllBooks), 
        empty(AllBooks).

% Signature: versatileAuthor(AuthorName) /1
% Purpose: check if the author with name {AuthorName} has written books in at least three different genres
versatileAuthor(AuthorName) :- 
        author(AuthorId, AuthorName), 
        findall(X, book(_, AuthorId, X, _), AllGenres), 
        sort(AllGenres, AllGenresWithoutDuplicates), 
        len(AllGenresWithoutDuplicates, Len), 
        Len > 2.